const { encrypt, decrypt } = require("../src/services/encryption");

describe("encryption", () => {
  test("encrypt/decrypt round-trip", () => {
    const plain = "secret-value";
    const enc = encrypt(plain);
    expect(enc).toBeTruthy();
    expect(decrypt(enc)).toBe(plain);
  });

  test("decrypt with garbage returns null", () => {
    expect(decrypt("not-valid-base64!!!")).toBeNull();
  });
});
