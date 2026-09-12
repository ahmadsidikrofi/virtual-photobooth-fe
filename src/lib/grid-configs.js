export const GRID_CONFIGS = {
  strip_1x4: {
    id: "strip_1x4",
    name: "Classic 1×4",
    requiredPhotos: 4,
    type: "strip",
  },
  strip_1x3: {
    id: "strip_1x3",
    name: "Trio 1×3",
    requiredPhotos: 3,
    type: "strip",
  },
  strip_1x2: {
    id: "strip_1x2",
    name: "Duo 1×2",
    requiredPhotos: 2,
    type: "strip",
  },
  wide_2x2: {
    id: "wide_2x2",
    name: "Wide 2×2",
    requiredPhotos: 4,
    type: "postcard",
  },
  full_2x3: {
    id: "full_2x3",
    name: "Full 2×3",
    requiredPhotos: 6,
    type: "postcard",
  },
  editorial_8cut: {
    id: "editorial_8cut",
    name: "Editorial 8-Cut (3-2-3)",
    requiredPhotos: 8,
    type: "postcard",
    layoutPattern: [3, 2, 3], // 3 foto di atas, 2 di tengah, 3 di bawah
  },
};
