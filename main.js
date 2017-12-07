(function() {
    'use strict';

    var OSG = window.OSG;
    var osg = OSG.osg;
    var osgDB = OSG.osgDB;
    var osgAnimation = OSG.osgAnimation;
    var osgViewer = OSG.osgViewer;

    var TransitionUpdateCallback = function(target) {
        this._target = target;
    };
    TransitionUpdateCallback.prototype = {
        update: function(node, nv) {
            var t = nv.getFrameStamp().getSimulationTime();
            var dt = t - node._lastUpdate;
            if (dt < 0) {
                return true;
            }
            node._lastUpdate = t;

            var m = node.getMatrix();
            var current = [];
            osg.mat4.getTranslation(current, m);
            var target = this._target;
            var dx = target[0] - current[0];
            var dy = target[1] - current[1];
            var dz = target[2] - current[2];

            var speedSqr = dx * dx + dy * dy + dz * dz;
            var maxSpeed = 10.0;
            var maxSpeedSqr = maxSpeed * maxSpeed;
            if (speedSqr > maxSpeedSqr) {
                var quot = maxSpeed / Math.sqrt(speedSqr);
                dx *= quot;
                dy *= quot;
                dz *= quot;
            }
            //osg.log('speed ' + Math.sqrt(dx*dx + dy*dy + dz*dz) );

            var ratio = osgAnimation.EaseInQuad(Math.min((t - node._start) / 2.0, 1.0));
            current[0] += dx * dt * ratio;
            current[1] += dy * dt * ratio;
            current[2] += dz * dt * ratio;

            osg.mat4.fromRotation(m, -(t - node._start) * ratio, node._axis);
            osg.mat4.setTranslation(m, current);
            return true;
        }
    };

    var createTexturedBox = function(centerx, centery, centerz, sizex, sizey, sizez, l, r, b, t) {
        var model = osg.createTexturedBoxGeometry(centerx, centery, centerz, sizex, sizey, sizez);

        var uvs = model.getAttributes().TexCoord0;
        var array = uvs.getElements();

        array[0] = l;
        array[1] = t;
        array[2] = l;
        array[3] = b;
        array[4] = r;
        array[5] = b;
        array[6] = r;
        array[7] = t;

        array[8] = l;
        array[9] = t;
        array[10] = l;
        array[11] = b;
        array[12] = r;
        array[13] = b;
        array[14] = r;
        array[15] = t;

        array[16] = 0;
        array[17] = 0;
        array[18] = 0;
        array[19] = 0;
        array[20] = 0;
        array[21] = 0;
        array[22] = 0;
        array[23] = 0;

        array[24] = 0;
        array[25] = 0;
        array[26] = 0;
        array[27] = 0;
        array[28] = 0;
        array[29] = 0;
        array[30] = 0;
        array[31] = 0;

        array[32] = 0;
        array[33] = 0;
        array[34] = 0;
        array[35] = 0;
        array[36] = 0;
        array[37] = 0;
        array[38] = 0;
        array[39] = 0;

        array[40] = 0;
        array[41] = 0;
        array[42] = 0;
        array[43] = 0;
        array[44] = 0;
        array[45] = 0;
        array[46] = 0;
        array[47] = 0;

        return model;
    };

    var createEffect = function() {

        var maxy = 5;

        var group = new osg.MatrixTransform();
        var cb = new TransitionUpdateCallback([0, 0, 0]);

		var x = 0;
        var y = 0;

		var mtr = new osg.MatrixTransform();
		mtr.setMatrix(osg.mat4.fromTranslation(osg.mat4.create(), [0, 0, 0]));
		var model = osg.createTexturedBoxGeometry(0, 0, 0, 2, 2, 2);

		mtr.addChild(model);
		group.addChild(mtr);
		mtr.addUpdateCallback(cb);
		var t = 0;
		mtr._lastUpdate = t;
		mtr._start = t;
		mtr._axis = [Math.random(), Math.random(), Math.random()];
		osg.vec3.normalize(mtr._axis, mtr._axis);

        return group;
    };

    function createScene() {
        var root = new osg.Node();

        var target = new osg.MatrixTransform();
		
        var material = new osg.Material();
        material.setDiffuse([0.69, 0.09, 0.12, 1]);
        target.getOrCreateStateSet().setAttributeAndModes(material);

        var targetModel = createEffect();
		target.addChild(targetModel);

        root.addChild(target);

        return root;
    }

    var main = function() {
        var canvas = document.getElementById('View');

        var viewer;
        viewer = new osgViewer.Viewer(canvas, {
            antialias: true,
            alpha: true
        });
        viewer.init();
		
        var rotate = new osg.MatrixTransform();
        rotate.addChild(createScene());
        viewer.getCamera().setClearColor([0.0, 0.0, 0.0, 0.0]);
        viewer.setSceneData(rotate);

        viewer.run();
    };

    window.addEventListener('load', main, true);
})();
