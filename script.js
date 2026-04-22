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

document.addEventListener("DOMContentLoaded", () => {
	attachFamilyChoiceNavigation();
	attachInlineRecipeViewer();

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