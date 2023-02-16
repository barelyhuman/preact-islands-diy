import BaseLayout from '../layouts/BaseLayout.js'
import Counter from '../components/Counter.island.js'

export default function () {
  const initData = { initValue: 10 }
  return (
    <>
      <BaseLayout>
        <section>
          <h1>Hello from Preact Islands</h1>
        </section>
        <Counter {...initData} />
      </BaseLayout>
    </>
  )
}
