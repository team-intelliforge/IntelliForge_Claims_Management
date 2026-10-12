from google.cloud.firestore_v1.base_query import FieldFilter


def snapshot_data(snapshot, include_id=True):
    if not snapshot.exists:
        return None
    data = snapshot.to_dict() or {}
    data.pop("id", None)
    if include_id:
        data["id"] = snapshot.id
    return data


async def get_document(collection, document_id, include_id=True):
    snapshot = await collection.document(str(document_id)).get()
    return snapshot_data(snapshot, include_id)


async def list_documents(collection, field=None, value=None, include_id=True):
    query = collection
    if field is not None:
        query = query.where(filter=FieldFilter(field, "==", value))
    return [snapshot_data(snapshot, include_id) async for snapshot in query.stream()]