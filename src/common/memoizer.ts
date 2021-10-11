
const memoizer = (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
  const fn: Function = descriptor.value

  const cache = {}

  descriptor.value = (...args: number[]) => {
    const key = args.join('-')

    if (!cache[key]) {
      cache[key] = fn.apply(target, args)
    } else {
      console.log(`Returning cached version of the results...`)
    }

    return cache[key]
  }

  return descriptor
}

export default memoizer
