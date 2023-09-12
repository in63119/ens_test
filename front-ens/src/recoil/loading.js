import { atom } from "recoil";
import { recoilPersist } from "recoil-persist";

const { persistAtom } = recoilPersist();

export const loadingState = atom({
  key: "loading",
  default: {
    isLoading: false,
  },
  effects_UNSTABLE: [persistAtom],
});
