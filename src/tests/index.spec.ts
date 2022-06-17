import { sum } from "../index";

it("init", () => {
  expect(1).toBe(1)
})

it("sum",() => {
  expect(sum(1,1)).toBe(2)
})