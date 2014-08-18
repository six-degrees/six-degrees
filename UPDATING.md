Updating Six Degrees of GitHub
==============================
This project is designed to be 100% static, allowing it to be run on any server
that supports serving static files.  It is designed to be run out of a web
browser on any devices, and is geared towards using as little data as possible
to determine how close two users are in the system.

Getting the data
================
The SQL dumps provided by GHTorrent were converted over to SQLite data dumps and
imported into SQLite databases for portability.  From there, individual parts
were converted in a JSON formatted set of data files that could be used on the
front end when determining the number of steps required.

Database dumps
--------------
The latest database dump can be retrieved from
[GHTorrent's downloads page][ghtorrent-download].  This project uses the MySQL
data dump which is available towards the top of the page, as the MongoDB dumps
are missing much of the follower data that exists in the MySQL dump.
The database dumps are available in a compressed format and must be decompressed
before they can be used.

Decompressing the SQL dump
--------------------------
The SQL dump is available in a gzipped format and be decompressed through the
command line.

```sh
zcat mysql-2014-08-06.sql.gz > gh-2014-08-06.sql

# OR

gunzip -c mysql-2014-08-06.sql.gz > gh-2014-08-06.sql
```

Cutting out the parts that are needed
-------------------------------------
In order to reduce the size of the database to as little as possible, you should
cut out only the tables that are needed within the SQL dump.  In our case, these
tables are `users` and `followers`.

You first need to find where these tables are created within the SQL dump.  This
can be done by running:

```sh
grep -n "CREATE TABLE" gh-2014-08-06.sql
```

Which should produce something similar to this.  Note the lines where the
`users` and `followers` tables are being created, these will be used in the next
section.

```sh
grep [to be finished] > reduced.sql
```

Converting the MySQL dump to a SQLite dump
------------------------------------------
You can skip this step if you have the space and packages installed to use a
MySQL database.  In this project, we chose to convert it to a SQLite database as
they are easily transferable across machines and self-contained.

While [solutions exist][mysql2sqlite] that claim to convert MySQL dumps to
SQLite dumps, we were not able to get any of them running on our systems.  A
Python script was created to automatically convert the MySQL dumps into a format
which adhered to all of the constraints within SQLite and
[is available in this gist][convert.py].

It should be run from the command line by running:

```sh
python convert.py reduced.sql reduced-sqlite.sql
```

Which should generate a SQLite version of the MySQL dump.

Creating the SQLite database
----------------------------
You should be able to create a new SQLite database by running:

```sh
cat reduced-sqlite.sql | sqlite3 gh.db
```

Keep in mind that this requires `sqlite3` to be present on the system.  You may
need to install this separately, as it is not available by default on all
systems.

Updating the JSON files
=======================
Once the SQLite database is generated, updating the JSON files just requires
running a script.  We use a set of Python scripts to generate the individual
JSON files for each user.  These files are available within the repositories for
the data sets.

```sh
python update.py ../gh.db .
```

The first argument should be the location of the SQLite database and the second
argument should be the location of the repository that should be updated.

[convert.py]: https://gist.github.com/kevin-brown/d5fd25cd67e42a0d6261
[ghtorrent-download]: http://ghtorrent.org/downloads.html
[mysql2sqlite]: https://gist.github.com/esperlu/943776
