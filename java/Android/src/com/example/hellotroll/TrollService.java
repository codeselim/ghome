package com.example.hellotroll;

import java.io.IOException;
import java.io.PrintWriter;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.net.SocketAddress;
import java.net.UnknownHostException;
import java.util.Scanner;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Handler;
import android.os.HandlerThread;
import android.os.IBinder;
import android.os.Looper;
import android.os.Message;
import android.os.Process;
import android.support.v4.app.NotificationCompat;
import android.support.v4.app.TaskStackBuilder;
import android.util.Log;
import android.widget.Toast;

public class TrollService extends Service {
	public static final String PREFS_NAME = "MyPrefsFile";
	protected static final String LOG_TAG = "TrollService";
	String ipAddress;
	private String login;
	private String password;
	private static boolean DBG = false;

	protected void TTextShow(String text) {
		if(!DBG) {
			return;
		}
		Toast.makeText(getApplicationContext(), text, Toast.LENGTH_SHORT)
				.show();
	}

	@Override
	public void onCreate() {
		super.onCreate();
		Log.v(LOG_TAG, "onCreate() launched.");
		HandlerThread thread = new HandlerThread("ServiceStartArguments",
		Process.THREAD_PRIORITY_BACKGROUND);
		thread.start();

		// Get the HandlerThread's Looper and use it for our Handler
		mServiceLooper = thread.getLooper();
		mServiceHandler = new ServiceHandler(mServiceLooper);
	};

	private Looper mServiceLooper;
	private ServiceHandler mServiceHandler;

	// Handler that receives messages from the thread
	private final class ServiceHandler extends Handler {
		private static final long RETRY_CONNECT_DELAY = 10 * 1000;

//		private static final String IP_ADDR = "192.168.0.13";

		private static final int PORT = 5000;

		private int mId;

		public ServiceHandler(Looper looper) {
			super(looper);
		}

		protected boolean connect() {
			SharedPreferences settings = getSharedPreferences(PREFS_NAME, 0);
			ipAddress = settings.getString("ip_address", "192.168.0.1");
			login = settings.getString("login", "");
			password = settings.getString("pwd", "");
			
			if (mConnected) {// Only one connection has to be established, if
								// there is already one, then don't do anything
				return true;
			}

			InetAddress addr = null;
			try {
				addr = InetAddress.getByName(ipAddress);
			} catch (UnknownHostException e1) {
				stopAndRelaunchConnection();
				return false;
			}
			SocketAddress remoteAddr = new InetSocketAddress(addr, PORT);
			mSock = new Socket();
			try {
				mSock.connect(remoteAddr);
			} catch (IOException e1) {
				TTextShow("Socket.connect() error");
				Log.e(LOG_TAG, "Socket connect error\n" + e1.getCause());
				stopAndRelaunchConnection();
				return false;
			}
			postDelayed(new Runnable() {
				
				@Override
				public void run() {
					readUntilDeath();
				}
			}, 100);
			return true;
		}
		
		protected void readUntilDeath() {
			Scanner sc = null;
			try {
				sc = new Scanner(mSock.getInputStream());
			} catch (IOException e1) {
				stopAndRelaunchConnection();
				return;
			}
			// If we want to do some data sending to the server, the following
			// code might help:

			// PrintWriter out = null;
			// try {
			// out = new PrintWriter(sock.getOutputStream());
			// } catch (IOException e1) {
			// // TODO Auto-generated catch block
			// e1.printStackTrace();
			// }
			//
			// for (int i = 0; i < 10; i++) {
			// synchronized (this) {
			// TTextShow("Sending message Hi to server");
			// out.println("Hi!");
			// out.flush();
			// TTextShow(sc.nextLine());
			// try {
			// wait(3000);
			// } catch (Exception e) {
			// }
			// }
			// }
			// out.close();
			// TTextShow("For loop ended");

			Pattern pattern = Pattern.compile("notif: ([^\t]+)((\t)url: ([^\t]+))?",
					Pattern.CASE_INSENSITIVE);

			try {
				// Start the never ending story !
				for (;;) {
					String str = sc.nextLine();
					Matcher m = pattern.matcher(str);
					if (m.find()) {
						notif(m.group(1), m.group(4));
					} else {
						Log.v("BLORG", m.toString());
					}
					Log.v(LOG_TAG, "Notification received: " + str);
					TTextShow(str);
				}
			} catch (Exception e1) {
				stopAndRelaunchConnection();
				return;
			}
		}

		boolean mConnected = false;

		Socket mSock = new Socket();

		@Override
		public void handleMessage(Message msg) {
			if(!mConnected) {
				connect();
			}
		}

		private void stopAndRelaunchConnection() {
			try {
				mSock.close();
			} catch(Exception e) {}//don't care
			mConnected = false;
			postDelayed(new Runnable() {
				public void run() {
					connect();
				}
			}, RETRY_CONNECT_DELAY);

		}

		NotificationCompat.Builder mBuilder = new NotificationCompat.Builder(
				getApplicationContext()).setSmallIcon(R.drawable.ic_launcher);

		private void notif(String msg, String url) {
			mBuilder.setContentTitle("GHome").setContentText(
					msg);
			// Creates an explicit intent for an Activity in your app
			if(null == url) {
				url = "http://" + ipAddress + "/blorg";
			}
			Intent resultIntent = new Intent(Intent.ACTION_VIEW, 
				       Uri.parse(url));
//			Intent resultIntent = new Intent(getApplicationContext(),
//					MainActivity.class);

			// The stack builder object will contain an artificial back stack
			// for the
			// started Activity.
			// This ensures that navigating backward from the Activity leads out
			// of
			// your application to the Home screen.
//			TaskStackBuilder stackBuilder = TaskStackBuilder
//					.create(getApplicationContext());
//			// Adds the back stack for the Intent (but not the Intent itself)
//			stackBuilder.addParentStack(MainActivity.class);
//			// Adds the Intent that starts the Activity to the top of the stack
//			stackBuilder.addNextIntent(resultIntent);
//			PendingIntent resultPendingIntent = stackBuilder.getPendingIntent(
//					0, PendingIntent.FLAG_UPDATE_CURRENT);
		    PendingIntent resultPendingIntent = PendingIntent.getActivity(getApplicationContext(), 0, resultIntent, 0);
			mBuilder.setContentIntent(resultPendingIntent);
			NotificationManager mNotificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
			// mId allows you to update the notification later on.
			mNotificationManager.notify(mId++, mBuilder.build());

		}
	}

	@Override
	public void onDestroy() {
		super.onDestroy();
		Log.v(LOG_TAG, "onDestroy() launched.");
		TTextShow("TrollService onDestroy()");
	};

	@Override
	public IBinder onBind(Intent arg0) {
		Log.v(LOG_TAG, "onBind() launched.");
		TTextShow("TrollService onBind()");
		return null;
	}

	@Override
	public int onStartCommand(Intent intent, int flags, int startId) {
		Log.v(LOG_TAG, "onStartCommand() launched.");
		Message msg = mServiceHandler.obtainMessage();
		msg.arg1 = flags;
		msg.arg2 = startId;
		mServiceHandler.sendMessage(msg);

		// If we get killed, after returning from here, restart
		return START_STICKY;
	}

}
