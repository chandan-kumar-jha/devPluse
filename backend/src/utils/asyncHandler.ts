import { Request, Response, NextFunction } from 'express'

type AsyncFn = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>

// ── Wraps async controllers — catches errors automatically ─────────
export const asyncHandler = (fn: AsyncFn) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next)
  }
}