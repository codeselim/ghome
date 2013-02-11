CREATE TABLE `daily_stats` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `sensor_id` INTEGER NOT NULL,
  `sensor_type_id` INTEGER NOT NULL,
  `value` INTEGER NOT NULL,
  `min` INTEGER ,
  `max` INTEGER ,
  `time` INTEGER NOT NULL,
  FOREIGN KEY(sensor_type_id) REFERENCES sensor_types(id)
);

INSERT INTO daily_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,25,22,26,'2013-02-01');
INSERT INTO daily_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,24,21,25,'2013-02-02');
INSERT INTO daily_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,23,20,25,'2013-02-03');
INSERT INTO daily_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,23,21,24,'2013-02-04');
INSERT INTO daily_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,24,21,25,'2013-02-05');
INSERT INTO daily_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,24,22,26,'2013-02-06');
INSERT INTO daily_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,22,22,22,'2013-02-07');
INSERT INTO daily_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,23,22,24,'2013-02-08');
INSERT INTO daily_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,19,18,21,'2013-02-09');
INSERT INTO daily_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,20,19,21,'2013-02-10');
INSERT INTO daily_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,22,22,22,'2013-02-11');
INSERT INTO daily_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,22,22,22,'2013-02-12');
INSERT INTO daily_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,23,22,24,'2013-02-13');
INSERT INTO daily_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,24,22,26,'2013-02-14');
INSERT INTO daily_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,23,22,25,'2013-02-15');
INSERT INTO daily_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,22,21,23,'2013-02-16');
INSERT INTO daily_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,22,21,23,'2013-02-17');
INSERT INTO daily_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,20,20,20,'2013-02-18');
INSERT INTO daily_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,23,22,24,'2013-02-19');
INSERT INTO daily_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,24,22,26,'2013-02-20');
INSERT INTO daily_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,20,19,21,'2013-02-21');
INSERT INTO daily_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,25,22,28,'2013-02-22');
INSERT INTO daily_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,24,22,26,'2013-02-23');
INSERT INTO daily_stats (sensor_id,sensor_type_id,value,min,max,time) VALUES (1,1,24,21,26,'2013-02-24');


INSERT INTO daily_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,25,'2013-02-01');
INSERT INTO daily_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,24,'2013-02-02');
INSERT INTO daily_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,23,'2013-02-03');
INSERT INTO daily_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,23,'2013-02-04');
INSERT INTO daily_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,24,'2013-02-05');
INSERT INTO daily_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,24,'2013-02-06');
INSERT INTO daily_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,22,'2013-02-07');
INSERT INTO daily_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,23,'2013-02-08');
INSERT INTO daily_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,19,'2013-02-09');
INSERT INTO daily_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,20,'2013-02-10');
INSERT INTO daily_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,22,'2013-02-11');
INSERT INTO daily_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,22,'2013-02-12');
INSERT INTO daily_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,23,'2013-02-13');
INSERT INTO daily_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,24,'2013-02-14');
INSERT INTO daily_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,23,'2013-02-15');
INSERT INTO daily_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,22,'2013-02-16');
INSERT INTO daily_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,22,'2013-02-17');
INSERT INTO daily_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,20,'2013-02-18');
INSERT INTO daily_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,23,'2013-02-19');
INSERT INTO daily_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,24,'2013-02-20');
INSERT INTO daily_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,20,'2013-02-21');
INSERT INTO daily_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,25,'2013-02-22');
INSERT INTO daily_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,24,'2013-02-23');
INSERT INTO daily_stats (sensor_id,sensor_type_id,value,time) VALUES (1,5,24,'2013-02-24');
