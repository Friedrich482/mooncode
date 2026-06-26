import { Mock } from "vitest";

import { Procedure } from "@vitest/spy";

export type MockedDrizzle = {
  select: Mock<Procedure>;
  from: Mock<Procedure>;
  where: Mock<Procedure>;
  limit: Mock<Procedure>;
  insert: Mock<Procedure>;
  values: Mock<Procedure>;
  returning: Mock<Procedure>;
  update: Mock<Procedure>;
  set: Mock<Procedure>;
  delete: Mock<Procedure>;
  orderBy: Mock<Procedure>;
  innerJoin: Mock<Procedure>;
  groupBy: Mock<Procedure>;
  offset: Mock<Procedure>;
  as: Mock<Procedure>;
  execute: Mock<Procedure>;
};
