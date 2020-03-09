var { sendFileText } = require("../app");

test("should upload one file", async () => {
  const result = await sendFileText([
    { path: "./public/877  mars 3 2020, 5:02:31   null" }
  ]);
  expect(result).toEqual(expect.any(Array));
  expect(result.length >= 1).toBeTruthy();

  for (let i = 0; i < result.length; i++) {
    expect(result[i].scores).toEqual(expect.any(Boolean));
    expect(result[i].diag).toEqual(expect.any(String));
  }
});

test("should upload multy files", async () => {
  const result = await sendFileText([
    { path: "./public/877  mars 3 2020, 5:02:31   null" },
    { path: "./public/1066  mars 1er 2020, 7:16:52   null" }
  ]);
  expect(result).toEqual(expect.any(Array));
  expect(result.length >= 1).toBeTruthy();

  for (let i = 0; i < result.length; i++) {
    expect(result[i].scores).toEqual(expect.any(Number));
    expect(result[i].diag).toEqual(expect.any(String));
  }
});
