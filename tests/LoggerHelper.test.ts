import "ts-jest";
import { LoggerHelper } from "../src/LoggerHelper";

describe("LoggerHelper.toMaskedJSON", () => {
  test("object", () => {
    expect(
      LoggerHelper.toMaskedJSON({
        array: [2, 3, 5, 8],
        string: "hello",
        date: new Date(1609286400000),
        custom: {
          toJSON(key: string) {
            return { key };
          },
        },
      })
    ).toStrictEqual({
      array: [2, 3, 5, 8],
      string: "hello",
      date: "2020-12-30T00:00:00.000Z",
      custom: { key: "custom" },
    });
  });

  test("object with a circular reference", () => {
    const b = { b: 12 },
      a = { a: null as any, b1: b, b2: b };
    a.a = a;
    expect(LoggerHelper.toMaskedJSON(a)).toStrictEqual({
      a: "[Circular]",
      b1: { b: 12 },
      b2: { b: 12 },
    });
    const c = LoggerHelper.toMaskedJSON(a, [], "", false);
    expect(c.a).toBe(c);
  });

  test("object with masked keys", () => {
    expect(
      LoggerHelper.toMaskedJSON({ id: 1234, password: "secret" }, ["password"])
    ).toStrictEqual({ id: 1234, password: "[***]" });
    expect(
      LoggerHelper.toMaskedJSON({ id: 1234, Password: "secret" }, ["password"])
    ).toStrictEqual({ id: 1234, Password: "[***]" });
    expect(
      LoggerHelper.toMaskedJSON({ id: 1234, password: "secret" }, ["Password"])
    ).toStrictEqual({ id: 1234, password: "[***]" });
    expect(
      LoggerHelper.toMaskedJSON({ id: 1234, Password: "secret" }, ["Password"])
    ).toStrictEqual({ id: 1234, Password: "[***]" });
  });
});
