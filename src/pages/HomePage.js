import Counter from '../components/Counter.js'
import BaseLayout from '../layouts/BaseLayout.js'

export default function () {
  const initData = { initValue: 10 }
  return (
    <>
      <BaseLayout>
        <section>
          <h1>Hello from Preact Islands</h1>
        </section>
        <div id="counter" data-props={JSON.stringify(initData)}>
          <Counter {...initData} />
        </div>
      </BaseLayout>
    </>
  )
}
