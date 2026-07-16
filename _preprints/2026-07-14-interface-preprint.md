---
title: "Analysis-aware interface coarsening for elliptic problems driven by an equilibrated flux estimator"
collection: preprints
permalink: /preprint/2026-07-14-interface-preprint
date: 2026-07-14
venue: 'arXiv'
paperurl: 'https://arxiv.org/pdf/2607.11297'
citation: 'Grappein, D., Weder, P., 2026. Analysis-aware interface coarsening for elliptic problems driven by an equilibrated flux estimator. https://doi.org/10.48550/arXiv.2607.11297'
---
We propose an _a posteriori_ error estimator that relies on an equilibrated flux reconstruction to enable analysis-aware interface coarsening decisions in elliptic interface problems. Interface coarsening consists of simplifying an internal interface that separates regions characterized by different physical properties in order to facilitate the meshing process and reduce the total number of degrees of freedom. 
This process extends the concept of _defeaturing_, where small features on the boundary of a computational domain are removed.
Here, the features lie on an interior interface instead. The focus is on a Laplace problem with
a discontinuous diffusion coefficient. 
The estimator accounts for both the modeling error arising from the interface coarsening and the numerical error from the discrete approximation of the solution to the coarsened-interface problem.
It is localized on the mesh elements, and its constants explicitly track the contrast between the diffusion coefficients. The impact of different features can be assessed individually, yielding local contributions that indicate which features to coarsen and which to retain for a given mesh size.
The use of an equilibrated flux reconstruction allows us to sharply bound the bulk numerical source of error. We prove the reliability of the estimator and verify it across several numerical examples, including the case where an internal interface is fully removed.

[Download preprint here](https://arxiv.org/pdf/2607.11297)