export interface Assignment {
   id: string;
   title: string;
   assignedOn: string;
   dueDate?: string;
}

export const assignments: Assignment[] = [];

export const currentUser = {
   name: "Dr. Amit Sharma",
   avatar: "/assets/profile/amit-avatar.png",
};

export const schoolInfo = {
   name: "Mauni International School",
   location: "Bokaro Steel City",
   logo: "/assets/school/mauni-logo.png",
};
