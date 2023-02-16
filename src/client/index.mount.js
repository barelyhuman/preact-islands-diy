import { h, hydrate } from 'preact'
import { setup } from 'goober'

setup(h)

const mount = async (Component, elm) => {
  if (elm?.dataset?.props) {
    const props = JSON.parse(elm.dataset.props)
    delete elm.dataset.props
    hydrate(<Component {...props} />, elm)
  }
}

const main = async () => {
  // re-mount Counter as a client side component
  const Counter = (await import('../components/Counter.js')).default

  mount(Counter, document.getElementById('counter'))
}

main()
