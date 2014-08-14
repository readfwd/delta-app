var Famous = {};

Famous.View = require('famous/core/View');
Famous.Engine = require('famous/core/Engine');
Famous.Surface = require('famous/core/Surface');
Famous.Transform = require('famous/core/Transform');
Famous.RenderNode = require('famous/core/RenderNode');
Famous.Modifier = require('famous/core/Modifier');
Famous.EventEmitter = require('famous/core/EventEmitter');

Famous.ContainerSurface = require('famous/surfaces/ContainerSurface');

Famous.StateModifier = require('famous/modifiers/StateModifier');
Famous.ShowModifier = require('./famous-ShowModifier');

Famous.Transitionable = require('famous/transitions/Transitionable');
Famous.SnapTransition = require('famous/transitions/SnapTransition');
Famous.SpringTransition = require('famous/transitions/SpringTransition');
Famous.Transitionable.registerMethod('snap', Famous.SnapTransition);
Famous.Transitionable.registerMethod('spring', Famous.SpringTransition);

Famous.GridLayout = require('famous/views/GridLayout');
Famous.FlexibleLayout = require('famous/views/FlexibleLayout');
Famous.RenderController = require('famous/views/RenderController');
Famous.HeaderFooterLayout = require('famous/views/HeaderFooterLayout');

Famous.Timer = require('famous/utilities/Timer');

module.exports = Famous;
