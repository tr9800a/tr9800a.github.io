---
layout: page
title: Speaking & Writing
permalink: /speaking/
---
<section class="section">
  <div class="section__header">
    <h2>Speaking &amp; Publications</h2>
  </div>
  <div class="card-grid">
  {% assign sorted_talks = site.talks | sort: "date" | reverse %}
  {% for talk in sorted_talks %}
    {% include talk-card.html talk=talk %}
  {% endfor %}
  </div>
</section>

<section class="section">
  <div class="section__header">
    <h2>Writing</h2>
  </div>
  <div class="card-grid">
  {% for article in site.data.writing %}
    <article class="card">
      <h3 class="card__title">{{ article.title }}</h3>
      <a class="card__link" href="{{ article.url }}" target="_blank" rel="noopener">Read on LinkedIn →</a>
    </article>
  {% endfor %}
  </div>
  <p><a href="https://www.linkedin.com/in/tristan-mckinnon/recent-activity/articles/" target="_blank" rel="noopener">See all articles on LinkedIn →</a></p>
</section>
