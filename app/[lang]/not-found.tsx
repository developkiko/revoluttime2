import { NfScreen } from "@/components/layout/NfScreen";

/** 404 внутри локали — params в not-found недоступны, локаль берёт клиент. */
export default function NotFound() {
  return <NfScreen code="404" kind="notFound" />;
}
