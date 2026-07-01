---
layout: page
title: Projects
permalink: /projects/
---
<div class="card-grid">
{% assign sorted_projects = site.projects | sort: "featured_order" %}
{% for project in sorted_projects %}
  {% include project-card.html project=project %}
{% endfor %}
</div>
