const express = require('express');
const path = require('path');
const cookieSession = require('cookie-session');
const createError = require('http-errors');

const FeedbackService = require('./services/FeedbackService');
const SpeakersService = require('./services/SpeakerService');

const feedbackService = new FeedbackService('./data/feedback.json');
const speakerService = new SpeakersService('./data/speakers.json');

const routes = require('./routes');

const app = express();

const port = 3000;

app.set('trust proxy', 1);

app.use(
	cookieSession({
		name: 'session',
		keys: ['thisIsSuperScret', 'Alsoverysecret!!'],
	})
);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));

app.locals.siteName = 'ROUX Meetups';

app.use(express.static(path.join(__dirname, './static')));

app.use(async (req, res, next) => {
	try {
		const names = await speakerService.getNames();
		res.locals.speakerNames = names;
		return next();
	} catch (error) {
		return next(err);
	}
});

app.use('/', routes({ feedbackService, speakerService }));

app.use((req, res, next) => {
	return next(createError(404, 'File Not Found'));
});

app.use((err, req, res, next) => {
	res.locals.message = err.message;
	const status = err.status || 500;
	res.locals.status = status;
	res.status(status);
	res.render('error');
});

app.listen(port, () => {
	console.log(`Server is listening on port ${port}`);
});
