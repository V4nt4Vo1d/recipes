function attachFamilyChoiceNavigation() {
	const familyChoice = document.querySelector("#familyChoice");

	if (!familyChoice) {
		return;
	}

	familyChoice.addEventListener("click", (event) => {
		const navigationTarget = event.target.closest("[data-page]");

		if (!navigationTarget) {
			return;
		}

		const targetPage = navigationTarget.dataset.page;

		if (targetPage) {
			event.preventDefault();
			window.location.assign(targetPage);
		}
	});
}

function closeRecipeModal() {
	const modal = document.querySelector("[data-recipe-modal]");
	const modalContent = modal?.querySelector("[data-recipe-modal-content]");

	if (!modal || !modalContent) {
		return;
	}

	modal.hidden = true;
	modalContent.innerHTML = "";
	document.body.classList.remove("modal-open");

	document.querySelectorAll("[data-recipe-target]").forEach((button) => {
		button.setAttribute("aria-expanded", "false");
	});
}

function openRecipeModal(section, recipeButton) {
	const modal = document.querySelector("[data-recipe-modal]");
	const modalContent = modal?.querySelector("[data-recipe-modal-content]");

	if (!modal || !modalContent) {
		return;
	}

	modalContent.innerHTML = section.innerHTML;
	modal.hidden = false;
	document.body.classList.add("modal-open");
	recipeButton.setAttribute("aria-expanded", "true");
}

function attachInlineRecipeViewer() {
	const recipeWorkspaces = document.querySelectorAll(".recipe-workspace");

	recipeWorkspaces.forEach((workspace) => {
		workspace.addEventListener("click", (event) => {
			const recipeButton = event.target.closest("[data-recipe-target]");

			if (!recipeButton || !workspace.contains(recipeButton)) {
				return;
			}

			const targetId = recipeButton.dataset.recipeTarget;
			const targetSection = targetId ? workspace.querySelector(`#${targetId}`) : null;
			const buttons = workspace.querySelectorAll("[data-recipe-target]");
			const sections = workspace.querySelectorAll(".recipe-detail-section");
			const shouldShow = Boolean(targetSection && targetSection.hidden);
			const isMobile = window.matchMedia("(max-width: 860px)").matches;

			buttons.forEach((button) => {
				button.setAttribute("aria-expanded", "false");
			});

			sections.forEach((section) => {
				section.hidden = true;
			});

			if (!targetSection || !shouldShow) {
				closeRecipeModal();
				return;
			}

			if (isMobile) {
				openRecipeModal(targetSection, recipeButton);
				return;
			}

			closeRecipeModal();
			recipeButton.setAttribute("aria-expanded", "true");
			targetSection.hidden = false;
		});
	});
}

function setActiveCategory(root, activeCategory) {
	const toggles = root.querySelectorAll("[data-category-toggle]");
	const panels = root.querySelectorAll("[data-category-panel]");

	toggles.forEach((toggle) => {
		const isActive = toggle.dataset.categoryToggle === activeCategory;
		toggle.setAttribute("aria-pressed", String(isActive));
	});

	panels.forEach((panel) => {
		panel.hidden = panel.dataset.categoryPanel !== activeCategory;
	});
}

function attachCategorySectionToggles() {
	const wrappers = document.querySelectorAll("[data-category-toggles]");

	wrappers.forEach((wrapper) => {
		const root = wrapper.closest("[data-recipe-page]") || document;
		const defaultToggle = wrapper.querySelector('[data-category-toggle][aria-pressed="true"]') || wrapper.querySelector("[data-category-toggle]");
		const defaultCategory = defaultToggle?.dataset.categoryToggle;

		if (defaultCategory) {
			setActiveCategory(root, defaultCategory);
		}

		wrapper.addEventListener("click", (event) => {
			const toggle = event.target.closest("[data-category-toggle]");

			if (!toggle || !wrapper.contains(toggle)) {
				return;
			}

			setActiveCategory(root, toggle.dataset.categoryToggle);
			closeRecipeModal();
		});
	});
}

function openRecipeFromHash() {
	const hash = window.location.hash.slice(1);

	if (!hash) {
		return;
	}

	const button = document.querySelector(`[data-recipe-target="${CSS.escape(hash)}"]`);

	if (button) {
		const categoryPanel = button.closest("[data-category-panel]");
		const recipePage = button.closest("[data-recipe-page]") || document;

		if (categoryPanel?.dataset.categoryPanel) {
			setActiveCategory(recipePage, categoryPanel.dataset.categoryPanel);
		}

		button.click();
		button.scrollIntoView({ behavior: "smooth", block: "nearest" });
	}
}

function initFeaturedCollectionRotator() {
	const featuredList = document.querySelector(".featured-recipe-list");

	if (!featuredList) {
		return;
	}

	const featuredItems = [
		{
			href: "ricketts.html#ricketts-chicken-noodles",
			name: "Chicken and Noodles",
			desc: "Rich broth and homestyle egg noodles - a Ricketts staple.",
			family: "Ricketts",
		},
		{
			href: "raifsnider.html#raifsnider-banana-bread",
			name: "Banana Bread",
			desc: "Moist, pecan-loaded quick bread from the Raifsnider kitchen.",
			family: "Raifsnider",
		},
		{
			href: "ricketts.html#ricketts-veggie-beef-stew",
			name: "Veggie Beef Stew",
			desc: "Ground beef with tomato sauce, potatoes, green beans, corn, and carrots.",
			family: "Ricketts",
		},
		{
			href: "raifsnider.html#raifsnider-texas-chili",
			name: "Texas Chili",
			desc: "Crockpot chili with peppers, tomato, and warm spices.",
			family: "Raifsnider",
		},
		{
			href: "ricketts.html#ricketts-potato-salad",
			name: "Potato Salad",
			desc: "Sliced potatoes, eggs, pickles, and Miracle Whip - classic and simple.",
			family: "Ricketts",
		},
		{
			href: "raifsnider.html#raifsnider-german-chocolate-brownies",
			name: "German Chocolate Brownies",
			desc: "Layered brownies with caramel, chopped nuts, and chocolate chips.",
			family: "Raifsnider",
		},
	];

	const cardsPerView = 3;
	let lastSignature = "";

	function shuffle(items) {
		const shuffled = [...items];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		return shuffled;
	}

	function pickCards() {
		if (featuredItems.length <= cardsPerView) {
			return shuffle(featuredItems);
		}

		let nextCards = [];
		let attempts = 0;

		do {
			nextCards = shuffle(featuredItems).slice(0, cardsPerView);
			attempts += 1;
		} while (
			nextCards.map((item) => item.href).sort().join("|") === lastSignature &&
			attempts < 6
		);

		lastSignature = nextCards.map((item) => item.href).sort().join("|");
		return nextCards;
	}

	function render(cards) {
		featuredList.innerHTML = cards
			.map(
				(card) =>
					`<li class="featured-recipe-item"><a href="${card.href}" class="featured-recipe-link"><span class="featured-recipe-name">${card.name}</span><span class="featured-recipe-desc">${card.desc}</span><span class="featured-recipe-family">${card.family}</span></a></li>`,
			)
			.join("");
	}

	function nextDelay() {
		return Math.floor(Math.random() * 30000) + 30000;
	}

	function rotate() {
		featuredList.classList.add("is-fading");
		setTimeout(() => {
			render(pickCards());
			featuredList.classList.remove("is-fading");
			setTimeout(rotate, nextDelay());
		}, 300);
	}

	render(pickCards());
	setTimeout(rotate, nextDelay());
}

function initKitchenWisdom() {
	const display = document.getElementById("wisdomDisplay");
	const textEl = document.getElementById("wisdomText");
	const badgeEl = document.getElementById("wisdomBadge");
	const attributionEl = document.getElementById("wisdomAttribution");

	if (!display || !textEl) {
		return;
	}

	const items = [
		{ type: "Quote", text: "Cooking is love made visible.", attribution: "" },
		{ type: "Tip", text: "The riper the banana, the better the bread — never toss the brown ones.", attribution: "" },
		{ type: "Quote", text: "The fondest memories are made gathered around the table.", attribution: "" },
		{ type: "Tip", text: "Let your chicken rest a few minutes before shredding — it holds in so much more of the juices.", attribution: "" },
		{ type: "Quote", text: "A recipe has no soul. You, as the cook, must bring soul to the recipe.", attribution: "" },
		{ type: "Tip", text: "Slow and low is the real secret to a great crockpot chili.", attribution: "" },
		{ type: "Quote", text: "Food is our common ground, a universal experience.", attribution: "" },
		{ type: "Tip", text: "Taste and season SEVERAL times throughout the cooking process", attribution: "" },
		{ type: "Quote", text: "The secret ingredient is always love — and a little extra butter.", attribution: "" },
		{ type: "Tip", text: "Always read the recipe before starting.... lol", attribution: "" },
	];

	let queue = [];

	function buildQueue() {
		const shuffled = [...items];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		return shuffled;
	}

	function pickNext() {
		if (queue.length === 0) {
			queue = buildQueue();
		}
		return queue.shift();
	}

	function randomDelay() {
		return Math.floor(Math.random() * 4000) + 3000;
	}

	function showItem(item) {
		textEl.textContent = item.text;
		badgeEl.textContent = item.type;
		attributionEl.textContent = item.attribution;
	}

	function rotate() {
		display.classList.add("is-fading");
		setTimeout(() => {
			showItem(pickNext());
			display.classList.remove("is-fading");
			setTimeout(rotate, randomDelay());
		}, 400);
	}

	showItem(pickNext());
	setTimeout(rotate, randomDelay());
}

document.addEventListener("DOMContentLoaded", () => {
	attachFamilyChoiceNavigation();
	attachCategorySectionToggles();
	attachInlineRecipeViewer();
	openRecipeFromHash();
	initFeaturedCollectionRotator();
	initKitchenWisdom();

	document.querySelectorAll("[data-recipe-modal-close]").forEach((control) => {
		control.addEventListener("click", closeRecipeModal);
	});

	window.addEventListener("resize", () => {
		if (!window.matchMedia("(max-width: 860px)").matches) {
			closeRecipeModal();
		}
	});

	document.addEventListener("keydown", (event) => {
		if (event.key === "Escape") {
			closeRecipeModal();
		}
	});
});