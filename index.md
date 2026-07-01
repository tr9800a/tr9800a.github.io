---
layout: default
title: Home
---
<section class="hero">
  <div class="hero__content">
    <p class="hero__eyebrow">Staff Data Engineer · Founder/PI, Deterministic Systems Lab</p>
    <h1 class="hero__title">Tristan McKinnon</h1>
    <p class="hero__subtitle">I build zero-trust data pipelines for the most regulated environments in healthcare, fintech, and federal government — and speak and write about what actually breaks in production.</p>
    <div class="hero__actions">
      <a class="button button--primary" href="{{ '/projects/' | relative_url }}">View Projects</a>
      <a class="button button--secondary" href="{{ '/contact/' | relative_url }}">Get in Touch</a>
    </div>
  </div>
</section>

<section class="section">
  <div class="section__header">
    <h2>Featured Projects</h2>
    <a href="{{ '/projects/' | relative_url }}">See all →</a>
  </div>
  <div class="card-grid">
  {% assign featured_projects = site.projects | sort: "featured_order" | slice: 0, 3 %}
  {% for project in featured_projects %}
    {% include project-card.html project=project %}
  {% endfor %}
  </div>
</section>

<section class="section">
  <div class="section__header">
    <h2>Speaking Highlights</h2>
    <a href="{{ '/speaking/' | relative_url }}">See all →</a>
  </div>
  <div class="card-grid">
  {% assign featured_talks = site.talks | where_exp: "t", "t.featured_order" | sort: "featured_order" %}
  {% for talk in featured_talks %}
    {% include talk-card.html talk=talk %}
  {% endfor %}
  </div>
</section>
