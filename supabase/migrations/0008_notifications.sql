-- 0008_notifications.sql
-- Create notifications system

CREATE TABLE IF NOT EXISTS notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    type text NOT NULL,
    title_ar text NOT NULL,
    title_en text NOT NULL,
    message_ar text NOT NULL,
    message_en text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own notifications
DROP POLICY IF EXISTS "Users can read own notifications" ON notifications;
CREATE POLICY "Users can read own notifications"
ON notifications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Allow users to mark notifications as read
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Trigger to notify user when their case is approved
CREATE OR REPLACE FUNCTION notify_case_approved() RETURNS trigger AS $$
BEGIN
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        INSERT INTO notifications (user_id, type, title_ar, title_en, message_ar, message_en)
        VALUES (
            NEW.applicant_id,
            'case_approved',
            'تمت الموافقة على قضيتك',
            'Your Case is Approved',
            'وافقت اللجنة القضائية على قضيتك: ' || NEW.title_ar,
            'The Judicial Committee has approved your case: ' || NEW.title_en
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_case_approved ON cases;
CREATE TRIGGER on_case_approved
    AFTER UPDATE ON cases
    FOR EACH ROW
    EXECUTE FUNCTION notify_case_approved();
