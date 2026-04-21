export type UserInviteRole = "ADMIN" | "STAFF" | "MASTER";

export type GenerateUserInviteInput = {
  role: UserInviteRole;
  createdById: string;
  appUrl: string;
};

export type UserInviteValidationResult =
  | {
      valid: true;
      role: UserInviteRole;
    }
  | {
      valid: false;
    };
