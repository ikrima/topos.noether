# Clinical and technical barriers for topology-preserving 3D segmentation in radiology

Topology-preserving segmentation methods face a fundamental tension: the anatomical features they aim to preserve are frequently corrupted by imaging physics, violated by pathology, and computationally intractable at clinical resolution. This report synthesizes 2020-2026 literature to identify specific failure scenarios where topological frameworks will encounter obstacles.

**The core challenge**: While Betti numbers and persistent homology offer mathematically elegant guarantees about connected components and holes, medical images routinely violate the assumptions these methods require—clean boundaries, consistent topology across resolutions, and stable features under noise. A single metal artifact can create dozens of spurious topological features, partial volume effects routinely merge structures separated by sub-voxel gaps, and pathological conditions fundamentally alter expected anatomical topology.

## Imaging physics creates false topology at every scale

Medical imaging artifacts systematically generate spurious topological features that cannot be distinguished from true anatomy using persistence-based methods alone.

**CT beam hardening** produces dark bands between high-attenuation structures (e.g., posterior fossa between petrous bones) that create **false disconnections** in continuous structures. The cupping artifact makes object centers appear similar in density to surroundings, potentially **merging distinct regions**. Metal artifacts from dental implants or orthopedic hardware generate severe streak patterns—bright streaks can bridge anatomically separate structures while dark voids create gaps in continuous tissue. Studies show **63% of AI segmentation failures** in head and neck imaging trace directly to dental artifacts or anatomical variants.

**Partial volume effects** create the most insidious topological corruption. When two structures are separated by gaps smaller than **2× voxel size**, intervening voxels contain signal from both structures, creating artificial bridges. Conversely, structures smaller than voxel dimensions disappear entirely, creating false holes. The critical threshold is stochastic: gaps of 1-2 voxels appear connected or disconnected depending on where the voxel grid falls relative to anatomy—making topological features **non-reproducible** between scans. At typical clinical CT slice thickness (3-5mm), cortical bone, thin septa, and small vessels routinely show artifactual topology changes.

| Artifact Type | False Connections | False Disconnections |
|--------------|-------------------|---------------------|
| CT beam hardening | Cupping merges center with surround | Dark bands sever structures |
| Metal artifacts | Bright streaks bridge anatomy | Signal voids create gaps |
| MRI susceptibility | Pile-up regions merge structures | Blooming obscures boundaries |
| Partial volume | Sub-voxel gaps appear connected | Sub-voxel structures vanish |
| Thick slices (>3mm) | Through-plane connections | Thin septa and vessels lost |

**MRI susceptibility artifacts** at air-tissue interfaces (paranasal sinuses, skull base) cause geometric distortion that warps anatomical relationships, potentially creating false connections between spatially separated structures. Chemical shift artifacts produce systematic boundary displacement—the "India ink artifact" creates false separations at all fat-tissue interfaces. Gibbs ringing at sharp boundaries generates oscillating intensity patterns that can be misinterpreted as anatomical features, with **~9% local intensity error** affecting threshold-based topology computation.

## Topological methods have fundamental limitations for medical imaging

Persistent homology—the mathematical foundation for topology-preserving segmentation—faces critical obstacles when applied to clinical images.

**Computational complexity is prohibitive** for clinical 3D volumes. Standard persistent homology computation runs in **O(n³)** time where n is the number of voxels. Betti Matching Loss, the most accurate topology-aware training objective, requires O(n³) complexity per forward pass, limiting practical application to small patches (typically 64×64 pixels). For a clinical CT volume (512×512×500 voxels), computing persistent homology on the full resolution is intractable. Current workarounds—cropping to small patches—sacrifice the global context needed to correctly assess whether distant regions are connected.

**Betti numbers are fundamentally non-differentiable**. Because Betti numbers are discrete integers, all current approaches use soft approximations that introduce their own failure modes. Gradient computation fails when function values at different vertices are equal or when matching is ambiguous—cases that occur frequently in practice despite constituting "measure zero" theoretically. The Wasserstein matching used in early topology-aware losses **matches cycles incorrectly in >99% of cases** on standard benchmarks like CREMI.

**Noise generates spurious topological features** that obscure genuine anatomy. While theoretical stability theorems exist, practical persistence diagrams are dominated by low-persistence features from image noise. The standard practice of filtering "short-lived" features lacks theoretical justification—there is no principled way to distinguish noise-induced topology from real anatomical features at similar scales. Studies show artificial neural networks can outperform persistent homology in noisy settings by learning implicit regularization.

**Topological constraints can degrade segmentation accuracy**. The clDice loss function, designed to preserve tubular connectivity, "boosts topological consistency at the expense of segmentation accuracy." When topological loss weight λ is too large, training either converges poorly or produces results with many small holes. For cardiac atria segmentation, Dice score degradation is "particularly pronounced" when applying topological constraints due to complex anatomical presentation.

## Pathology fundamentally violates expected topology

A critical weakness of topology-preserving methods is their reliance on priors about normal anatomy—priors that pathological conditions routinely violate.

**Infiltrating tumors lack segmentable boundaries**. Glioblastoma spreads along white matter tracts with no distinct boundary between tumor and edema. The BraTS challenge explicitly acknowledges that "radiologic definition of tumor boundaries, especially in infiltrative tumors as gliomas, is a well-known problem." The "whole tumor" region in BraTS includes edema, infiltrating tumor, AND post-treatment changes—all showing overlapping T2/FLAIR signal without topological distinction. No algorithm ranked top for all tumor sub-regions; different architectures excel at different components.

**Multifocal disease creates ambiguous connectivity**. Multifocal glioblastoma (**~17.5% of cases**) shows multiple enhancing foci connected by T2/FLAIR abnormality—but whether these represent one tumor with infiltrative connections or truly separate lesions cannot be determined from imaging alone. Enforcing single-component topology would be incorrect for multicentric disease; enforcing multiple components would be incorrect for connected multifocal patterns.

**Post-treatment changes mimic pathology**. Pseudoprogression affects **30-50% of treated glioblastoma patients**, creating imaging features indistinguishable from true recurrence. The BraTS challenge now includes post-treatment cases specifically because algorithms must distinguish residual/recurrent tumor from radiation necrosis—a task that requires longitudinal and multimodal data beyond single-timepoint topology.

**Liver pathology alters vascular topology**. In cirrhotic liver, the caudate lobe hypertrophies (due to direct IVC blood supply sparing it from portal hypertension) while other segments atrophy. Regenerative nodules can mimic masses, and arterio-portal shunts create imaging artifacts. The Couinaud segmentation that topology-preserving methods might enforce assumes normal hepatic vein anatomy—an assumption violated in **>50% of patients** with advanced liver disease.

## Domain-specific failure modes compound across anatomical systems

Each organ system presents unique topological challenges that current methods handle poorly.

**Pancreas segmentation** represents extreme class imbalance (<0.8% of CT volume) with blurry boundaries against duodenum and variable shape across patients. Best nnU-Net performance achieves Dice 0.94 but common failures occur at the pancreatic head-duodenum interface where similar intensities create false connections.

**Small vessels and branching structures** suffer from over-smoothing at boundaries—a fundamental limitation of U-Net architectures that lose fine spatial details during downsampling. Skip connections do not fully recover information for structures spanning only 1-2 voxels. Connectivity preservation failures are systematic for vessels smaller than 2× voxel resolution.

**Cardiac segmentation** requires strict topological constraints—the left ventricle must be a single connected region, myocardium must form a continuous ring—but 2D short-axis acquisition creates apparent topology changes as heart structures move in and out of imaging planes. The requirement for slice-wise topological priors is "an artifact of CMR short axis acquisition" that doesn't reflect true 3D anatomy.

**Lung nodule topology** provides diagnostic information (spiculation indicates **90% positive predictive value** for malignancy in nodules >1cm), but current methods struggle with nodule-vessel attachment discrimination and the transition from ground-glass to solid components.

## Inter-rater disagreement limits achievable topological accuracy

Ground truth annotations exhibit substantial variability that directly limits what topology-preserving methods can achieve.

Quantitative inter-rater agreement varies dramatically by structure: mean Dice of **0.79±0.23** for malignant skin lesions, **0.81** (range 0.19-0.96) for breast cancer MRI, and Cohen's kappa of only **0.244** (fair agreement) for liver lesion segmentation. For challenging structures like infiltrative tumor boundaries, expert disagreement exceeds algorithmic error.

Small structures show lowest reproducibility. Test-retest Dice of expert manual segmentations reaches only **~86.6%** for subcortical structures like thalamus and hippocampus. Annotation inconsistencies propagate directly to trained models—networks learn to reproduce the variance in their training labels, making topological correctness inherently bounded by annotation quality.

| Structure Type | Inter-rater Dice | Topological Reliability |
|---------------|------------------|------------------------|
| Large homogeneous organs | 0.90-0.95 | High |
| Well-defined tumors | 0.83 | Moderate |
| Challenging tumors | 0.75 | Low |
| Infiltrative boundaries | 0.65-0.75 | Very low |
| Small subcortical structures | 0.70-0.86 | Low |

## Deployment constraints limit practical topology computation

**Inference time requirements** vary dramatically by clinical context. Emergency stroke triage requires sub-minute turnaround; AI-assisted detection at University of Rochester reduced ICH turnaround by **36.6%**. Current FDA-cleared 3D segmentation tools achieve 10-12 seconds for 256³ volumes on gaming GPUs, but topology-aware methods add substantial overhead—Betti Matching requires O(n³) additional computation.

**Scanner variability causes domain shift**. Models trained on one vendor's scanner systematically fail on others—MRI shows the most severe domain shift due to vendor-specific reconstruction algorithms and field strength differences. Multi-center validation studies consistently show performance degradation when models cross institutional boundaries. The M&M cardiac MRI challenge demonstrated this effect across GE, Philips, and Siemens scanners.

**Regulatory pathways don't evaluate topology**. The FDA 510(k) process (97% of AI device clearances) focuses on Dice coefficient and clinical validity, not topological correctness. Only **11 of 118 FDA-cleared algorithms** validated on >1,000 patients, and only one device reported multi-site validation. There is no regulatory framework for evaluating whether topological constraints improve or harm clinical utility.

**Memory constraints force patch-based processing**. Full-resolution 3D volumes (512×512×458) can require >10 minutes inference on standard hospital workstations. Patch-based approaches lose global topological context—a small patch cannot determine whether two regions in distant patches should be connected. The 16GB RAM limit on standard clinical workstations fundamentally constrains topology computation.

## Specific scenarios where topological methods will fail

Based on this synthesis, topology-preserving frameworks will encounter critical obstacles in:

- **High-artifact regions**: Dental implants, orthopedic hardware, air-tissue interfaces where spurious topological features dominate
- **Infiltrating pathology**: Glioblastoma, pancreatic cancer, hepatocellular carcinoma where boundaries are biologically undefined
- **Sub-voxel structures**: Thin septa, small vessels, fine trabecular patterns where partial volume effects determine topology stochastically
- **Post-treatment imaging**: Where pseudoprogression, radiation necrosis, and true recurrence share topological characteristics
- **Large 3D volumes**: Where O(n³) complexity forces patch-based processing that sacrifices global connectivity information
- **Multi-vendor deployment**: Where domain shift creates systematic differences in apparent topology
- **Anatomical variants**: Where normal variation violates assumed topological priors in ~15% of patients

## Conclusion

Topology-preserving segmentation offers theoretical elegance but faces practical barriers at every stage of the clinical imaging pipeline. Imaging physics generates false topology indistinguishable from anatomy. Computational complexity limits application to small patches. Pathology violates expected priors. Inter-rater variability bounds achievable accuracy. And deployment constraints—scanner variability, inference time, memory limits—further restrict practical utility.

For the RTT framework to succeed, it must address these challenges through: robust artifact detection and exclusion, adaptive topological priors that accommodate pathological variation, efficient approximations that scale to clinical resolution, and validation protocols that evaluate topology's clinical impact rather than just mathematical correctness. The most promising applications are structures with consistent topology (mid-ventricular cardiac slices, tubular vessels in clean images) where priors reliably hold and computational cost is manageable.