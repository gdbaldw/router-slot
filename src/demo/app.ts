import { ChangeStateEvent, GLOBAL_ROUTER_EVENTS_TARGET, IRouterSlot, NavigationCancelEvent, NavigationEndEvent, NavigationErrorEvent, NavigationStartEvent, NavigationSuccessEvent, path, PushStateEvent, ReplaceStateEvent, RouterSlot } from "../lib";
import { ROUTER_SLOT_TAG_NAME } from "../lib/config";

import "./../lib/router-link";

/**
 * Asserts that the user is authenticated.
 */
function sessionGuard () {

	if (localStorage.getItem("session") == null) {
		history.replaceState(null, "", "login");
		return false;
	}

	return true;
}


// Setup the router
customElements.whenDefined(ROUTER_SLOT_TAG_NAME).then(async () => {
	const routerSlot = document.querySelector<IRouterSlot>(ROUTER_SLOT_TAG_NAME)!;

	let hasInitialized = false;
	routerSlot.addEventListener("changestate", () => {
		if (!hasInitialized) {
			document.body.classList.add("initialized");
			hasInitialized = true;
		}
	});

	GLOBAL_ROUTER_EVENTS_TARGET.addEventListener("pushstate", (e: PushStateEvent) => {
		console.log("On push state", `'${path()}'`);
	});

	GLOBAL_ROUTER_EVENTS_TARGET.addEventListener("replacestate", (e: ReplaceStateEvent) => {
		console.log("On replace state", path());
	});

	GLOBAL_ROUTER_EVENTS_TARGET.addEventListener("popstate", (e: PopStateEvent) => {
		console.log("On pop state", path(), e.state);
	});

	GLOBAL_ROUTER_EVENTS_TARGET.addEventListener("changestate", (e: ChangeStateEvent) => {
		console.log("On change state", path());
	});

	GLOBAL_ROUTER_EVENTS_TARGET.addEventListener("navigationstart", (e: NavigationStartEvent) => {
		console.log("Navigation start", e.detail);
	});

	GLOBAL_ROUTER_EVENTS_TARGET.addEventListener("navigationend", (e: NavigationEndEvent) => {
		window.scrollTo({top: 0, left: 0, behavior: "smooth"});
		console.log("Navigation end", e.detail);
	});

	GLOBAL_ROUTER_EVENTS_TARGET.addEventListener("navigationsuccess", (e: NavigationSuccessEvent) => {
		console.log("Navigation success", e.detail);
	});

	GLOBAL_ROUTER_EVENTS_TARGET.addEventListener("navigationcancel", (e: NavigationCancelEvent) => {
		console.log("Navigation cancelled", e.detail);
	});

	GLOBAL_ROUTER_EVENTS_TARGET.addEventListener("navigationerror", (e: NavigationErrorEvent) => {
		console.log("Navigation failed", e.detail);
	});

	await routerSlot.add([
		{
			path: `login`,
			component: () => import("./pages/login/login")
		},
		{
			path: `home`,
			component: () => import("./pages/home/home"),
			guards: [sessionGuard]
		},
		{
			// You can give the component as a HTML element if you want
			path: `div`,
			component: () => {
				const $div = document.createElement("div");
				$div.innerText = `Heres a <div> tag!`;

				const $slot = new RouterSlot();
				$slot.add([
					{
						path: "route",
						fuzzy: true,
						component: () => {
							const $div = document.createElement("div");
							$div.innerText = `Here's another <div> tag!`;
							return $div;
						}
					},
					{
						path: "**",
						redirectTo: "/div/route"
					}
				]);
				$div.appendChild($slot);
				return $div;
			}
		},
		{
			path: "**",
			redirectTo: `home`,
			preserveQuery: true
		}
	]);
});
