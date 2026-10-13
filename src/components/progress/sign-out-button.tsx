import { doSignOut } from "@/app/progress/actions";
import { buttonClasses } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <form action={doSignOut}>
      <button type="submit" className={buttonClasses({ variant: "secondary", size: "sm" })}>
        Sign out
      </button>
    </form>
  );
}
