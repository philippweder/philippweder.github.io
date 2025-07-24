---
permalink: /
title: ""
excerpt: ""
author_profile: true
redirect_from: 
  - /about/
  - /about.html
---

Hi there! Welcome to my personal website.

I am a PhD student at the Chair for Numerical Methods and Simulation ([MNS](https://mns.epfl.ch)) at EPFL under the supervision of Prof. Annalisa Buffa. I work on isogeometric analysis and analysis-aware defeaturing.

### News

<div style="max-height: 300px; overflow-y: auto; border: 1px solid #e3e3e3; border-radius: 5px; padding: 15px; background-color: #fafafa;">
{% assign sorted_posts = site.posts | sort: 'date' | reverse %}
{% for post in sorted_posts %}
  {% include news-single.html %}
{% endfor %}
</div>