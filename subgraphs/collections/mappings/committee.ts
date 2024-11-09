import { MemberSet } from "../generated/Committee/Committee";
import { createOrLoadAccount } from "../helpers/account";

export function handleMemeberSet(event: MemberSet): void {
  let account = createOrLoadAccount(event.params._member);

  account.isCommitteeMember = event.params._value;

  account.save();
}
