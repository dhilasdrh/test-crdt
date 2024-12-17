export const nodes = [
  {
    id: "1",
    position: { x: 0, y: 9 },
    data: { label: "A" },
    width: 50,
    height: 50,
  },
  {
    id: "2",
    position: { x: 125, y: 125 },
    data: { label: "B" },
    width: 50,
    height: 50,
  },
  {
    id: "3",
    position: { x: 0, y: 250 },
    data: { label: "C" },
    width: 50,
    height: 50,
  },
  {
    id: "4",
    position: { x: -125, y: 125 },
    data: { label: "D" },
    width: 50,
    height: 50,
  },
];

export const edges = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
  },
];
