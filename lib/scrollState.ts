// Shared mutable view state — written by DOM listeners, read by the 3D scene
// every frame without triggering React re-renders.
export const view = {
  scroll: 0, // 0..1 page scroll progress
  px: 0, // pointer x, -1..1
  py: 0, // pointer y, -1..1
  section: 0, // current section index
};

export const SECTION_COLORS = [
  "#8b7cff", // hero
  "#4cc9f0", // about
  "#43e97b", // skills
  "#f72585", // projects
  "#ffb703", // services
  "#ff6b6b", // testimonials
  "#8b7cff", // contact
];
