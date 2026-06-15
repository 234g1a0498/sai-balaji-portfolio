import cv2
import mediapipe as mp
import pyautogui
import math
import time

# Screen size
screen_width, screen_height = pyautogui.size()

# MediaPipe initialization
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(max_num_hands=1)
mp_draw = mp.solutions.drawing_utils

# Video capture
cap = cv2.VideoCapture(0)

# Click and scroll cooldowns
last_left_click = 0
last_right_click = 0
click_cooldown = 0.5  # seconds

prev_y_palm = None

# Function to count fingers
def count_fingers(hand_landmarks):
    tips = [4, 8, 12, 16, 20]  # Thumb, Index, Middle, Ring, Pinky tips
    count = 0
    # For simplicity, check if tip is above PIP joint (y smaller = finger up)
    for tip in tips[1:]:  # ignore thumb for fist detection
        if hand_landmarks.landmark[tip].y < hand_landmarks.landmark[tip - 2].y:
            count += 1
    return count

while True:
    ret, frame = cap.read()
    if not ret:
        continue

    frame = cv2.flip(frame, 1)  # mirror image
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(rgb_frame)

    if results.multi_hand_landmarks:
        for hand_landmarks in results.multi_hand_landmarks:
            mp_draw.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)

            # Cursor control: index finger tip
            x_index = hand_landmarks.landmark[8].x
            y_index = hand_landmarks.landmark[8].y
            x_screen = int(x_index * screen_width)
            y_screen = int(y_index * screen_height)
            pyautogui.moveTo(x_screen, y_screen, duration=0.01)

            # Measure hand distance (approximation using Z coordinate)
            z_hand = hand_landmarks.landmark[0].z  # palm base Z
            current_time = time.time()

            # Left click: hand close (Z small)
            if z_hand < -0.9 and current_time - last_left_click > click_cooldown:
                pyautogui.click()
                last_left_click = current_time

            # Right click: fist (less than 2 fingers up)
            fingers = count_fingers(hand_landmarks)
            if fingers < 2 and current_time - last_right_click > click_cooldown:
                pyautogui.click(button='right')
                last_right_click = current_time

            # Scroll: open palm vertical movement
            y_palm = hand_landmarks.landmark[0].y
            if prev_y_palm is not None:
                delta = prev_y_palm - y_palm
                if abs(delta) > 0.09:
                    if delta > 0:
                        pyautogui.scroll(150)  # scroll up
                    else:
                        pyautogui.scroll(-150)  # scroll down
            prev_y_palm = y_palm

    cv2.imshow("Air Gesture Mouse", frame)
    if cv2.waitKey(1) & 0xFF == 27:  # ESC to exit
        break

cap.release()
cv2.destroyAllWindows()
