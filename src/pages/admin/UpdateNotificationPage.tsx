// pages/UpdateNotificationPage.tsx
import { useParams } from "react-router-dom";
import PageLitLayout from "../../layouts/PageListLayout";
import NotificationForm from "../../components/features/notifications/NotificationForm";
import useNotifications from "../../hooks/notifications/useNotifications";
import PageLayout from "../../layouts/PageLayout";

export default function UpdateNotificationPage() {
  const { id } = useParams();
  const { notifications, loading } = useNotifications({});
  const notification = notifications?.find(n => n.id === id || n._id === id);

  if (loading) {
    return (
      <PageLayout title="Modifier la notification">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PageLayout>
    );
  }

  if (!notification) {
    return (
      <PageLayout title="Modifier la notification">
        <div className="px-6 py-8 max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-500">Notification non trouvée</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Modifier la notification">
     
      <div className="px-6 py-8 max-w-4xl mx-auto">
        <NotificationForm notification={notification} isEdit={true} />
      </div>
    </PageLayout>
  );
}