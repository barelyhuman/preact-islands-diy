export const onClientOnly = fn => {
  if (typeof window !== 'undefined') {
    fn()
  }
}
