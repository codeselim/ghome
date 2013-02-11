CREATE TABLE `hour_stats` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `sensor_id` INTEGER NOT NULL,
  `sensor_type_id` INTEGER NOT NULL,
  `value` INTEGER NOT NULL,
  `min` INTEGER ,
  `max` INTEGER ,
  `time` DATE NOT NULL,
  FOREIGN KEY(sensor_type_id) REFERENCES sensor_types(id)
);

INSERT INTO hour_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,25,22,26,'2013-02-08 00:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,24,21,25,'2013-02-08 01:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,23,20,25,'2013-02-08 02:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,23,21,24,'2013-02-08 03:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,24,21,25,'2013-02-08 04:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,24,22,26,'2013-02-08 05:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,22,22,22,'2013-02-08 06:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,23,22,24,'2013-02-08 07:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,19,18,21,'2013-02-08 08:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,20,19,21,'2013-02-08 09:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,22,22,22,'2013-02-08 10:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,22,22,22,'2013-02-08 11:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,23,22,24,'2013-02-08 12:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,24,22,26,'2013-02-08 13:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,23,22,25,'2013-02-08 14:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,22,21,23,'2013-02-08 15:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,22,21,23,'2013-02-08 16:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,20,20,20,'2013-02-08 17:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,23,22,24,'2013-02-08 18:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,24,22,26,'2013-02-08 19:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,20,19,21,'2013-02-08 20:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,25,22,28,'2013-02-08 21:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,24,22,26,'2013-02-08 22:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,24,21,26,'2013-02-08 23:00:00');

INSERT INTO hour_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,24,20,42,'2013-02-09 01:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,24,20,42,'2013-02-09 02:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,24,20,42,'2013-02-09 03:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,24,20,42,'2013-02-09 04:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,24,20,42,'2013-02-09 05:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,24,20,42,'2013-02-09 06:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,24,20,42,'2013-02-09 07:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,24,20,42,'2013-02-09 08:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,24,20,42,'2013-02-09 00:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,24,20,42,'2013-02-09 09:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,24,20,42,'2013-02-09 10:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,24,20,42,'2013-02-09 11:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,24,20,42,'2013-02-09 12:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,24,20,42,'2013-02-09 13:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,24,20,42,'2013-02-09 14:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,24,20,42,'2013-02-09 15:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,24,20,42,'2013-02-09 16:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,24,20,42,'2013-02-09 17:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,24,20,42,'2013-02-09 18:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,24,20,42,'2013-02-09 19:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,24,20,42,'2013-02-09 20:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,24,20,42,'2013-02-09 21:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,24,20,42,'2013-02-09 22:00:00');

INSERT INTO hour_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,25,'2013-02-08 00:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,24,'2013-02-08 01:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,23,'2013-02-08 02:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,23,'2013-02-08 03:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,24,'2013-02-08 04:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,24,'2013-02-08 05:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,22,'2013-02-08 06:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,23,'2013-02-08 07:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,19,'2013-02-08 08:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,20,'2013-02-08 09:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,22,'2013-02-08 10:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,22,'2013-02-08 11:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,23,'2013-02-08 12:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,24,'2013-02-08 13:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,23,'2013-02-08 14:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,22,'2013-02-08 15:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,22,'2013-02-08 16:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,20,'2013-02-08 17:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,23,'2013-02-08 18:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,24,'2013-02-08 19:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,20,'2013-02-08 20:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,25,'2013-02-08 21:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,24,'2013-02-08 22:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,24,'2013-02-08 23:00:00');

INSERT INTO hour_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,24,'2013-02-09 02:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,24,'2013-02-09 01:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,24,'2013-02-09 03:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,24,'2013-02-09 04:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,24,'2013-02-09 05:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,24,'2013-02-09 06:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,24,'2013-02-09 07:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,24,'2013-02-09 08:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,24,'2013-02-09 00:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,24,'2013-02-09 09:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,24,'2013-02-09 10:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,24,'2013-02-09 11:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,24,'2013-02-09 12:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,24,'2013-02-09 13:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,24,'2013-02-09 14:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,24,'2013-02-09 15:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,24,'2013-02-09 16:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,24,'2013-02-09 17:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,24,'2013-02-09 18:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,24,'2013-02-09 19:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,24,'2013-02-09 20:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,24,'2013-02-09 21:00:00');
INSERT INTO hour_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,24,'2013-02-09 22:00:00');