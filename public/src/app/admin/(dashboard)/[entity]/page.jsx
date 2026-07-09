import { notFound } from "next/navigation";
import AdminEntityList from "@/components/admin/AdminEntityList";
import { ENTITIES, isKnownEntity } from "@/lib/admin-entities";

export async function generateMetadata({ params }) {
  const { entity } = await params;
  return { title: ENTITIES[entity]?.label || "Not Found" };
}

export default async function EntityListPage({ params }) {
  const { entity } = await params;
  if (!isKnownEntity(entity)) notFound();
  const config = ENTITIES[entity];
  return <AdminEntityList entity={entity} label={config.label} icon={config.icon} listCols={config.listCols} />;
}
