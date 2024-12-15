---
category: tech
title: Building My Astro Blog - Part 1
description: A series of posts about creating my Astro blog site
pubDate: 2024-11-20T07:55:00.000Z
updatedDate: 2024-11-27T21:43:00.000Z
heroImage: /images/a-realistic-image-of-a-computer-keyboard-monitor-and-typical-programmer-items-with-a-blog-post-titled-building-my-astro-blog-site-displayed-on-the-screen-with-a-wide-margin-around-it..png
tags:
  - astro
  - web development
  - blogging
language: NodeJS, Typescript, markdown
codeRepo: https://github.com/bvold/frontend
---
Building a personal blog site has been something I've wanted to do for a long time.  In a previous job, I used the [Hugo](https://gohugo.io) site generator to build a static website for internal documentation.  I was working on some documentation concepts for a website at work and it started getting me interested in pursuing the personal blog site again.  I actually started out using Hugo, but then I discovered [Astro](https://astro.build) somewhere along the way and started looking into it and decided it was really worth checking out, and here I am ...

It started very simply with the create sequence:

```shell
npm create astro@latest
```

<p>

To keep things easy, I decided to use the Astro blog template starter.
