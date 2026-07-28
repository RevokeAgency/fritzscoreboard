import { describe, it, expect } from "vitest";
import {
  absatzstufeAusKisten,
  bewerteBewegung,
  STANDARD_CONFIG,
} from "./scoring";

describe("absatzstufeAusKisten", () => {
  it("leitet die Stufe an den Grenzen korrekt ab", () => {
    expect(absatzstufeAusKisten(0)).toBe("wenig");
    expect(absatzstufeAusKisten(249)).toBe("wenig");
    expect(absatzstufeAusKisten(250)).toBe("mittel");
    expect(absatzstufeAusKisten(499)).toBe("mittel");
    expect(absatzstufeAusKisten(500)).toBe("hoch");
    expect(absatzstufeAusKisten(1000)).toBe("hoch");
    expect(absatzstufeAusKisten(1001)).toBe("kam");
  });
});

describe("bewerteBewegung – neulistung", () => {
  it("wenig + mainstream ohne exklusiv = 1", () => {
    const r = bewerteBewegung({
      typ: "neulistung",
      kisten_jahr: 100,
      kundentyp: "mainstream",
      exklusiv: false,
    });
    expect(r.punkte).toBe(1);
    expect(r.absatzstufe).toBe("wenig");
    expect(r.ist_kam).toBe(false);
  });

  it("hoch + influential + exklusiv = 6 (Maximum)", () => {
    const r = bewerteBewegung({
      typ: "neulistung",
      kisten_jahr: 600,
      kundentyp: "influential",
      exklusiv: true,
    });
    expect(r.punkte).toBe(6);
    expect(r.punkte_absatz).toBe(3);
    expect(r.punkte_typ).toBe(2);
    expect(r.punkte_exklusiv).toBe(1);
  });

  it("mittel + premium ohne exklusiv = 3", () => {
    const r = bewerteBewegung({
      typ: "neulistung",
      kisten_jahr: 300,
      kundentyp: "premium",
      exklusiv: false,
    });
    expect(r.punkte).toBe(3);
  });

  it("exklusiv gibt genau +1", () => {
    const ohne = bewerteBewegung({
      typ: "neulistung",
      kisten_jahr: 100,
      kundentyp: "mainstream",
      exklusiv: false,
    });
    const mit = bewerteBewegung({
      typ: "neulistung",
      kisten_jahr: 100,
      kundentyp: "mainstream",
      exklusiv: true,
    });
    expect(mit.punkte - ohne.punkte).toBe(1);
  });

  it("deckt die gesamte Spanne 1..6 ab", () => {
    const min = bewerteBewegung({
      typ: "neulistung",
      kisten_jahr: 10,
      kundentyp: "mainstream",
      exklusiv: false,
    });
    const max = bewerteBewegung({
      typ: "neulistung",
      kisten_jahr: 999,
      kundentyp: "influential",
      exklusiv: true,
    });
    expect(min.punkte).toBe(1);
    expect(max.punkte).toBe(6);
  });
});

describe("bewerteBewegung – exklusivdrehung", () => {
  it("liefert nur die Absatzpunkte (1..3)", () => {
    expect(bewerteBewegung({ typ: "exklusivdrehung", kisten_jahr: 100 }).punkte).toBe(1);
    expect(bewerteBewegung({ typ: "exklusivdrehung", kisten_jahr: 300 }).punkte).toBe(2);
    expect(bewerteBewegung({ typ: "exklusivdrehung", kisten_jahr: 700 }).punkte).toBe(3);
  });

  it("ignoriert Kundentyp und Exklusivitaet", () => {
    const r = bewerteBewegung({
      typ: "exklusivdrehung",
      kisten_jahr: 300,
      kundentyp: "influential",
      exklusiv: true,
    });
    expect(r.punkte).toBe(2);
    expect(r.punkte_typ).toBe(0);
    expect(r.punkte_exklusiv).toBe(0);
  });
});

describe("bewerteBewegung – verlust", () => {
  it("liefert negative Absatzpunkte (-1..-3)", () => {
    expect(bewerteBewegung({ typ: "verlust", kisten_jahr: 100, verlustgrund: "wettbewerb" }).punkte).toBe(-1);
    expect(bewerteBewegung({ typ: "verlust", kisten_jahr: 300, verlustgrund: "wettbewerb" }).punkte).toBe(-2);
    expect(bewerteBewegung({ typ: "verlust", kisten_jahr: 700, verlustgrund: "sonstige" }).punkte).toBe(-3);
  });

  it("stellt Schliessung und Insolvenz neutral (0 Punkte)", () => {
    const schliessung = bewerteBewegung({
      typ: "verlust",
      kisten_jahr: 700,
      verlustgrund: "schliessung",
    });
    const insolvenz = bewerteBewegung({
      typ: "verlust",
      kisten_jahr: 700,
      verlustgrund: "insolvenz",
    });
    expect(schliessung.punkte).toBe(0);
    expect(schliessung.neutral).toBe(true);
    expect(insolvenz.punkte).toBe(0);
    expect(insolvenz.neutral).toBe(true);
  });

  it("respektiert die abschaltbare Neutralregel", () => {
    const config = { ...STANDARD_CONFIG, verlust_neutral_bei_schliessung: false };
    const r = bewerteBewegung(
      { typ: "verlust", kisten_jahr: 700, verlustgrund: "schliessung" },
      config,
    );
    expect(r.punkte).toBe(-3);
    expect(r.neutral).toBe(false);
  });
});

describe("bewerteBewegung – KAM-Grenze", () => {
  it("markiert ueber 1000 Kisten als KAM und vergibt 0 Punkte", () => {
    const r = bewerteBewegung({
      typ: "neulistung",
      kisten_jahr: 1500,
      kundentyp: "influential",
      exklusiv: true,
    });
    expect(r.ist_kam).toBe(true);
    expect(r.punkte).toBe(0);
  });

  it("genau 1000 Kisten ist noch kein KAM", () => {
    const r = bewerteBewegung({
      typ: "neulistung",
      kisten_jahr: 1000,
      kundentyp: "mainstream",
      exklusiv: false,
    });
    expect(r.ist_kam).toBe(false);
    expect(r.absatzstufe).toBe("hoch");
    expect(r.punkte).toBe(3);
  });

  it("gilt auch fuer Verluste (KAM zaehlt nicht)", () => {
    const r = bewerteBewegung({
      typ: "verlust",
      kisten_jahr: 2000,
      verlustgrund: "wettbewerb",
    });
    expect(r.ist_kam).toBe(true);
    expect(r.punkte).toBe(0);
  });
});
