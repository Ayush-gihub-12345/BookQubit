import { notFound } from "next/navigation";
import AdminEntityForm from "@/components/admin/AdminEntityForm";
import { ENTITIES, isKnownEntity } from "@/lib/admin-entities";

export async function generateMetadata({ params }) {
  const { entity } = await params;
  return { title: ENTITIES[entity] ? `New ${ENTITIES[entity].label}` : "Not Found" };
}

export default async function NewEntityPage({ params }) {
  const { entity } = await params;
  if (!isKnownEntity(entity)) notFound();
  const config = ENTITIES[entity];
  return <AdminEntityForm entity={entity} label={config.label} fields={config.fields} />;
}
