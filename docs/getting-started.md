<nav>

[Home](/)

[Getting Started](/getting-started)

[Code](/the-code)

[Github](https://github.com/barelyhuman/preact-islands-diy)

</nav>

# Getting Started

## Basic Implementation

The basic implementation can be generalized for most SSR + Client Hydration
apps.

Here's an overview

1. Intially render the view on the server as a static page.
2. Hydrate the app on client

To go into the details of each.

### Initial Server Render

In this step, you still build the component tree with whatever UI library you're
using, Vue, React, Preact, Solid, etc. And then flatten the component tree to
only have the static and immediately computable data. In this case, no
sideeffects and state management based code is run.

The output is a static html document that you can send to the client.

Since this guide is tied to [preact](https://preactjs.com/), we're going to use
a library from the preact team that helps us achieve this.

Here's what a very rudimentary implementation of rendering a component on the
server would look like.

We're using `express.js` here as an example due to it being the first choice of
most beginners, the process is mostly same for any other web server engine you
pick up. Hapi, Koa, Fastify, etc.

```js
// server.js
import { h } from 'preact'
import preactRenderToString from 'preact-render-to-string'

// ...remainig express.js setup

const HomePage = () => {
  return h('h1', {}, 'hello')
}

app.get('/', async (req, res) => {
  res.send(preactRenderToString(h(HomePage, {})))
})
```

Here most work is done by `preactRenderToString` , and all we are doing is
writing components. With a little bit of bundling magic, we should be able to
write in JSX to make it a little more friendly to work with.

### Hydrate

Okay, so a term you'll see smart people use around a lot online.

- Partial Hydration
- Progressive Hydration
- add more as they find more such ways etc

To be put simply, it's to bind the interactivity to a DOM element with
_existing_ state/effects/events

This _existing_ state/effects/events might be sent from the server, but if
working with a component that can handle it's own and the logic is well
contained in it, you just mount the component on the DOM with the necessary
bindings.

As an example, this might looks a little something like this

```js
// client.js
import { hydrate } from 'preact'
import Counter from './Counter'

const main = () => {
  // assuming the server rendered the component with the following ID as well.
  const container = document.getElementById('counter')
  hydrate(h(Counter, {}), document.getElementById('counter'))
}

main()
```

Similar to the server render phase, we use a helper from the preact to help
hydrate a component. You could use `render` but then the actual element is
already something that was rendered by the server, rendering it again would make
no sense and so we just ask preact to try to add in the needed event and state
data instead

What I've explained above is called Partial Hydration, since you don't hydrate
the entire app and just hydrate certain parts of it.

## Into the Deep

There's nothing more, that you need to know to understand how to make an island
arch based app but let's now get into implementing this.

[The Code &rarr;](the-code)
