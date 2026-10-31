import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StateMessage } from "@/components/state-message";

export default function NotFound() {
  return (
    <StateMessage
      title="Nothing here"
      action={
        <Button asChild>
          <Link href="/">Pick a mood</Link>
        </Button>
      }
    >
      That page does not exist. Head back and choose how you want to feel.
    </StateMessage>
  );
}
