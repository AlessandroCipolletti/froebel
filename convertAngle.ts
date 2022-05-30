import { assert } from "./except.ts";
import oneOf from "./oneOf.ts";

type Angle = "degree" | "radian";

/**
 * Converts angle from one unit into another.
 *
 * @example
 * ```
 * convertAngle(180, "degree", "radian") // 3.14159
 * convertAngle(MAth.PI, "radian", "degree") // 180
 * ```
 */
const convertAngle = (value: number, from: Angle, to: Angle): number => {
  assert(isAngularUnit(from), `unknown angular unit ${from}`, TypeError);
  assert(isAngularUnit(to), `unknown angular unit ${to}`, TypeError);

  if (from === to) {
    return value;
  }

  const degree = toDegree(value, from);

  switch (to) {
    case "degree":
      return degree;

    case "radian":
      return degree * Math.PI / 180;
  }
};

export default convertAngle;

const toDegree = (value: number, unit: Angle): number => {
  switch (unit) {
    case "degree":
      return value;

    case "radian":
      return value * 180 / Math.PI;
  }
};

const isAngularUnit = (unit: string): unit is Angle =>
  oneOf(unit, "degree", "radian");
