customElements.define('toggle-tabs', class extends HTMLElement {

	/**
	 * Instantiate the Web Component
	 */
	constructor () {

		// Get parent class properties
		super();

		// Define properties
		this.tabList = this.querySelector('[tabs]');

		// Setup UI
		this.setup();

	}

	/**
	 * Handle events on the Web Component
	 * @param  {Event} event The event object
	 */
	handleEvent (event) {
		this[`on${event.type}`](event);
	}

	/**
	 * Handle click events
	 * @param  {Event} event The event object
	 */
	onclick (event) {

		// Only run on tab links
		if (!event.target.matches('[role="tab"]')) return;

		// Prevent the link from updating the URL
		event.preventDefault();

		// Ignore the currently active tab
		if (event.target.matches('[aria-selected="true"]')) return;

		// Toggle tab visibility
		this.toggle(event.target);

	}

	/**
	 * Handle keydown events
	 * @param  {Event} event The event object
	 */
	onkeydown (event) {

		// Only run for left and right arrow keys
		if (!['ArrowLeft', 'ArrowRight'].includes(event.code)) return;

		// Only run if element in focus is on a tab
		let tab = document.activeElement.closest('[role="tab"]');
		if (!tab) return;

		// Only run if focused tab is in this component
		if (!this.tabList.contains(tab)) return;

		// Get the currently active tab
		let currentTab = this.tabList.querySelector('[role="tab"][aria-selected="true"]');

		// Get the parent list item
		let listItem = currentTab.closest('li');

		// If right arrow, get the next sibling
		// Otherwise, get the previous
		let nextListItem = event.code === 'ArrowRight' ? listItem.nextElementSibling : listItem.previousElementSibling;
		if (!nextListItem) return;
		let nextTab = nextListItem.querySelector('a');

		// Toggle tab visibility
		this.toggle(nextTab);
		nextTab.focus();

	}

	/**
	 * Toggle tab visibility
	 * @param  {Node} tab The tab to show
	 */
	toggle (tab) {

		// Get the target tab pane
		let tabPane = this.querySelector(tab.hash);
		if (!tabPane) return;

		// Get the current tab and content
		let currentTab = tab.closest('[role="tablist"]').querySelector('[aria-selected="true"]');
		let currentPane = document.querySelector(currentTab.hash);

		// Update the selected tab
		tab.setAttribute('aria-selected', true);
		currentTab.setAttribute('aria-selected', false);

		// Update the visible tabPane
		tabPane.removeAttribute('hidden');
		currentPane.setAttribute('hidden', '');

		// Make sure current tab can be focused and other tabs cannot
		tab.removeAttribute('tabindex');
		currentTab.setAttribute('tabindex', -1);

	}

	/**
	 * Add buttons and hide content on page load
	 */
	setup () {

		// Only run if there are tabs
		if (!this.tabList) return;

		// Get the list items and links
		let listItems = this.tabList.querySelectorAll('li');
		let links = this.tabList.querySelectorAll('a');

		// Add ARIA to list
		this.tabList.setAttribute('role', 'tablist');

		// Add ARIA to the list items
		for (let item of listItems) {
			item.setAttribute('role', 'presentation');
		}

		// Add ARIA to the links and content
		let instance = this;
		links.forEach(function (link, index) {

			// Get the the target element
			let tabPane = instance.querySelector(link.hash);
			if (!tabPane) return;

			// Add [role] and [aria-selected] attributes
			link.setAttribute('role', 'tab');
			link.setAttribute('aria-selected', index === 0 ? true : false);

			// If it's not the active (first) tab, remove focus
			if (index > 0) {
				link.setAttribute('tabindex', -1);
			}

			// If there's no ID, add one
			if (!link.id) {
				link.id = `tab_${tabPane.id}`;
			}

			// Add ARIA to tab pane
			tabPane.setAttribute('role', 'tabpanel');
			tabPane.setAttribute('aria-labelledby', link.id);

			// If not the active pane, hide it
			if (index > 0) {
				tabPane.setAttribute('hidden', '');
			}

		});

		// Listen for events
		this.tabList.addEventListener('click', this);
		document.addEventListener('keydown', this);

	}

});
