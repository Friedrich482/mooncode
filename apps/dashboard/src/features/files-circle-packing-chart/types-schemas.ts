export type TreeNode = {
  type: "node";
  value: number;
  name: string;
  children: Tree[];
  key: string;
};
export type TreeLeaf = {
  type: "leaf";
  name: string;
  key: string;
  value: number;
};

export type Tree = TreeNode | TreeLeaf;

export type Bubble = Omit<d3.HierarchyCircularNode<Tree>, "constructor"> & {
  vx: number;
  vy: number;
};

type Grow<T, A extends Array<T>> = ((x: T, ...xs: A) => void) extends (
  ...a: infer X
) => void
  ? X
  : never;
type GrowToSize<T, A extends Array<T>, N extends number> = {
  0: A;
  1: GrowToSize<T, Grow<T, A>, N>;
}[A["length"] extends N ? 0 : 1];

export type FixedArray<T, N extends number> = GrowToSize<T, [], N>;
