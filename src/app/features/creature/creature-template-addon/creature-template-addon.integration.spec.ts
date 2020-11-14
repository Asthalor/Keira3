import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import Spy = jasmine.Spy;

import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { highlightOptions } from '@keira-config/highlight.config';
import { HIGHLIGHT_OPTIONS } from 'ngx-highlightjs';
import { CreatureTemplateAddonComponent } from './creature-template-addon.component';
import { CreatureTemplateAddonModule } from './creature-template-addon.module';
import { EditorPageObject } from '@keira-testing/editor-page-object';
import { CreatureHandlerService } from '../creature-handler.service';
import { CreatureTemplateAddon } from '@keira-types/creature-template-addon.type';
import { SaiCreatureHandlerService } from '../sai-creature-handler.service';

class CreatureTemplateAddonPage extends EditorPageObject<CreatureTemplateAddonComponent> {}

xdescribe('CreatureTemplateAddon integration tests', () => {
  let component: CreatureTemplateAddonComponent;
  let fixture: ComponentFixture<CreatureTemplateAddonComponent>;
  let queryService: MysqlQueryService;
  let querySpy: Spy;
  let handlerService: CreatureHandlerService;
  let page: CreatureTemplateAddonPage;

  const id = 1234;
  const expectedFullCreateQuery = 'DELETE FROM `creature_template_addon` WHERE (`entry` = 1234);\n' +
    'INSERT INTO `creature_template_addon` (`entry`, `path_id`, `mount`, `bytes1`, `bytes2`, `emote`, `isLarge`, `auras`) VALUES\n' +
    '(1234, 0, 0, 0, 0, 0, 0, \'\');';

  const originalEntity = new CreatureTemplateAddon();
  originalEntity.entry = id;
  originalEntity.auras = null;
  originalEntity.bytes1 = 1;
  originalEntity.bytes2 = 2;
  originalEntity.emote = 3;
  originalEntity.mount = 0;
  originalEntity.path_id = 123;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        CreatureTemplateAddonModule,
        RouterTestingModule,
      ],
      providers: [
        { provide: HIGHLIGHT_OPTIONS, useValue: highlightOptions },
        CreatureHandlerService,
        SaiCreatureHandlerService,
      ],
    })
      .compileComponents();
  }));

  function setup(creatingNew: boolean) {
    handlerService = TestBed.inject(CreatureHandlerService);
    handlerService['_selected'] = `${id}`;
    handlerService.isNew = creatingNew;

    queryService = TestBed.inject(MysqlQueryService);
    querySpy = spyOn(queryService, 'query').and.returnValue(of());

    spyOn(queryService, 'selectAll').and.returnValue(of(
      creatingNew ? [] : [originalEntity]
    ));

    fixture = TestBed.createComponent(CreatureTemplateAddonComponent);
    component = fixture.componentInstance;
    page = new CreatureTemplateAddonPage(fixture);
    fixture.autoDetectChanges(true);
    fixture.detectChanges();
  }

  describe('Creating new', () => {
    beforeEach(() => setup(true));

    it('should correctly initialise',   waitForAsync(async () => {
      page.expectQuerySwitchToBeHidden();
      page.expectFullQueryToBeShown();
      await page.expectFullQueryToContain(expectedFullCreateQuery);
    }));

    it('should correctly update the unsaved status', () => {
      const field = 'path_id';
      expect(handlerService.isCreatureTemplateAddonUnsaved).toBe(false);
      page.setInputValueById(field, 3);
      expect(handlerService.isCreatureTemplateAddonUnsaved).toBe(true);
      page.setInputValueById(field, 0);
      expect(handlerService.isCreatureTemplateAddonUnsaved).toBe(false);
    });

    it('changing a property and executing the query should correctly work', waitForAsync(async () => {
      const expectedQuery = 'DELETE FROM `creature_template_addon` WHERE (`entry` = 1234);\n' +
        'INSERT INTO `creature_template_addon` (`entry`, `path_id`, `mount`, `bytes1`, `bytes2`, `emote`, `isLarge`, `auras`) VALUES\n' +
        '(1234, 3, 0, 0, 0, 0, 0, \'\');';
      querySpy.calls.reset();

      page.setInputValueById('path_id', 3);
      page.clickExecuteQuery();

      await page.expectFullQueryToContain(expectedQuery);
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
    }));
  });

  describe('Editing existing', () => {
    beforeEach(() => setup(false));

    it('should correctly initialise',   waitForAsync(async () => {
      page.expectDiffQueryToBeShown();
      page.expectDiffQueryToBeEmpty();
      await page.expectFullQueryToContain('DELETE FROM `creature_template_addon` WHERE (`entry` = 1234);\n' +
        'INSERT INTO `creature_template_addon` (`entry`, `path_id`, `mount`, `bytes1`, `bytes2`, `emote`, `isLarge`, `auras`) VALUES\n' +
        '(1234, 123, 0, 1, 2, 3, 0, NULL);');
    }));

    it('changing all properties and executing the query should correctly work', waitForAsync(async () => {
      const expectedQuery = 'UPDATE `creature_template_addon` SET ' +
        '`path_id` = 0, `mount` = 1, `bytes1` = 2, `bytes2` = 3, `emote` = 4, `isLarge` = 5, `auras` = \'6\' WHERE (`entry` = 1234);';
      querySpy.calls.reset();

      page.changeAllFields(originalEntity, ['VerifiedBuild']);
      page.clickExecuteQuery();

      await page.expectDiffQueryToContain(expectedQuery);
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy.calls.mostRecent().args[0]).toContain(expectedQuery);
    }));

    it('changing values should correctly update the queries',  waitForAsync(async () => {
      page.setInputValueById('path_id', '3');
      await page.expectDiffQueryToContain(
        'UPDATE `creature_template_addon` SET `path_id` = 3 WHERE (`entry` = 1234);'
      );
      await page.expectFullQueryToContain(
        'DELETE FROM `creature_template_addon` WHERE (`entry` = 1234);\n' +
        'INSERT INTO `creature_template_addon` (`entry`, `path_id`, `mount`, `bytes1`, `bytes2`, `emote`, `isLarge`, `auras`) VALUES\n' +
        '(1234, 3, 0, 1, 2, 3, 0, NULL);'
      );

      page.setInputValueById('bytes1', '2');
      await page.expectDiffQueryToContain(
        'UPDATE `creature_template_addon` SET `path_id` = 3, `bytes1` = 2 WHERE (`entry` = 1234);'
      );
      await page.expectFullQueryToContain(
        'DELETE FROM `creature_template_addon` WHERE (`entry` = 1234);\n' +
        'INSERT INTO `creature_template_addon` (`entry`, `path_id`, `mount`, `bytes1`, `bytes2`, `emote`, `isLarge`, `auras`) VALUES\n' +
        '(1234, 3, 0, 2, 2, 3, 0, NULL);\n'
      );
    }));

    it('changing a value via SingleValueSelector should correctly work', waitForAsync(async () => {
      const field = 'bytes1';
      page.clickElement(page.getSelectorBtn(field));

      await page.whenReady();
      page.expectModalDisplayed();

      page.clickRowOfDatatableInModal(8);

      await page.whenReady();
      page.clickModalSelect();
      await page.whenReady();

      expect(page.getInputById(field).value).toEqual('8');
      await page.expectDiffQueryToContain(
        'UPDATE `creature_template_addon` SET `bytes1` = 8 WHERE (`entry` = 1234);'
      );
      await page.expectFullQueryToContain(
        'DELETE FROM `creature_template_addon` WHERE (`entry` = 1234);\n' +
        'INSERT INTO `creature_template_addon` (`entry`, `path_id`, `mount`, `bytes1`, `bytes2`, `emote`, `isLarge`, `auras`) VALUES\n' +
        '(1234, 123, 0, 8, 2, 3, 0, NULL);'
      );
    }));
  });
});
