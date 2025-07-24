---
layout: archive
title: ""
permalink: /publications/
author_profile: true
---

## Preprints

{% include base_path %}

<table style="width: 100%; border-collapse: collapse; border: none;">
{% for post in site.preprints reversed %}
  {% include archive-single-table.html %}
{% endfor %}
</table>

## Publications

{% if author.googlescholar %}
  You can also find my articles on <u><a href="{{author.googlescholar}}">my Google Scholar profile</a>.</u>
{% endif %}

{% include base_path %}

<table style="width: 100%; border-collapse: collapse; border: none;">
{% for post in site.publications reversed %}
  {% include archive-single-table.html %}
{% endfor %}
</table>

## Talks

{% include base_path %}

<table style="width: 100%; border-collapse: collapse; border: none;">
{% for post in site.talks reversed %}
  <tr>
    <td style="vertical-align: top; width: 50px; padding-right: 15px;">[{{ forloop.index }}]</td>
    <td style="vertical-align: top;">
      {% if post.link %}
        <a href="{{ post.link }}">{{ post.title }}</a>
      {% else %}
        <a href="{{ base_path }}{{ post.url }}" rel="permalink">{{ post.title }}</a>
      {% endif %}
      . {{ post.venue }}, {{ post.date | default: "1900-01-01" | date: "%Y" }}.
      {% if post.paperurl %}
        <a href="{{ post.paperurl }}"> [PDF]</a>
      {% endif %}
      <a href="{{ base_path }}{{ post.url }}" rel="permalink"> [Abstract]</a>
    </td>
  </tr>
{% endfor %}
</table>

