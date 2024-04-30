export type RunAnEventForm = {
	additionalRequirements?: string;
	characters?: string;
	contentAdvisory?: "Yes" | "No";
	eventDescription?: string;
	eventName?: string;
	eventTags?: string[];
	format?: string;
	gm?: string;
	gmAge?: string;
	eventLength?: string;
	minPlayers?: string;
	playerAge?: string;
	players?: string;
	playtest?: string;
	requestMediaEquipment?: string;
	requestPrivateRoom?: string;
	runNumberOfTimes?: string;
	safetyTools?: string;
	schedulingPref?: string;
	system?: string;
	tableType?: string;
	triggerWarnings?: string;
	userDisplayName?: string;
	safetyToolsOther?: string;
	userId?: string;
	userEmail?: string;
	discord?: string;
	phone?: string;
	authToken?: string;
	successPage?: string;
	failurePage?: string;
};

const eventsCreatePayload = {
	accessabilityOptions: "string",
	additionalGms: "string",
	additionalRequirements: "string",
	characters: "string",
	contentAdvisory: true,
	eventCategoryId: 0,
	eventDescription: "string",
	eventFacilitators: "string",
	eventMetadataIds: [0],
	eventMetadataNamesString: "string",
	eventName: "string",
	eventTags: ["string"],
	format: "string",
	gm: "string",
	gmAge: "string",
	length: "string",
	minPlayers: "string",
	otherInfo: "string",
	playerAge: "string",
	players: "string",
	playtest: "string",
	requestMediaEquipment: "string",
	requestMediaRoom: true,
	requestPrivateRoom: "string",
	runNumberOfTimes: 0,
	safetyTools: "string",
	schedulingPref: "string",
	system: "string",
	tableType: "string",
	triggerWarnings: "string",
	userDisplayName: "string",
};

export type EventsCreatePayload = typeof eventsCreatePayload;
