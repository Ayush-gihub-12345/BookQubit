"use client";

// One subscription to the reader's state for the whole page: the hero, the sticky bar and the phone bar all read the
// same like / wishlist / shelf / progress, so there is a single set of requests and they always agree.
import { createContext, useContext } from "react";
import useBookActions from "./useBookActions";

const Ctx = createContext(null);
export const useBookCtx = () => useContext(Ctx);

export default function BookActionsProvider({ book, children }) {
  const actions = useBookActions(book);
  return <Ctx.Provider value={actions}>{children}</Ctx.Provider>;
}
